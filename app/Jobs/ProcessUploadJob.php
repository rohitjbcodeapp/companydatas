<?php

namespace App\Jobs;

use App\Models\UploadHistory;
use App\Models\ColumnMapping;
use App\Models\Company;
use App\Models\WhatsappData;
use App\Models\UploadChunk;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ProcessUploadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $upload;

    public function __construct(UploadHistory $upload)
    {
        $this->upload = $upload;
    }

    public function handle()
    {
        try {
            // Resolve to actual storage path; the file was stored via Storage::put
            $filePath = Storage::path('uploads/' . $this->upload->filename);

            if (!file_exists($filePath)) {
                throw new \Exception('File not found');
            }

            // Get mappings keyed by source column
            $mappings = ColumnMapping::where('upload_id', $this->upload->id)
                ->where('is_selected', true)
                ->orderBy('column_order')
                ->get()
                ->keyBy('source_column');

            // Read Excel file
            $data = Excel::toArray(null, $filePath);
            $rows = $data[0] ?? [];

            if (empty($rows)) {
                throw new \Exception('No data found in file');
            }

            // Remove header row
            $headers = array_shift($rows);
            $totalRows = count($rows);

            // Update upload with total rows
            $this->upload->update(['total_rows' => $totalRows]);

            // Process in chunks of 500
            $chunkSize = 500;
            $chunks = array_chunk($rows, $chunkSize);
            $processedRows = 0;
            $skippedRows = 0;
            $duplicateRows = 0;

            foreach ($chunks as $chunkIndex => $chunk) {
                $processedData = [];

                foreach ($chunk as $row) {
                    $mappedRow = [];
                    $hasData = false;

                    foreach ($headers as $colIndex => $header) {
                        if (isset($mappings[$header])) {
                            $targetColumn = $mappings[$header]->target_column;
                            if ($targetColumn && isset($row[$colIndex])) {
                                $mappedRow[$targetColumn] = $row[$colIndex];
                                $hasData = true;
                            }
                        }
                    }

                    if ($hasData) {
                        $mappedRow['upload_id'] = $this->upload->id;
                        $processedData[] = $mappedRow;
                    } else {
                        $skippedRows++;
                    }
                }

                if (!empty($processedData)) {
                    // Store chunk
                    $chunkRecord = UploadChunk::create([
                        'upload_id' => $this->upload->id,
                        'chunk_id' => $chunkIndex,
                        'chunk_data' => json_encode($processedData),
                        'status' => 'pending',
                    ]);

                    // Process this chunk
                    $this->processChunk($chunkRecord, $processedData);
                    $processedRows += count($processedData);
                }
            }

            // Update final stats
            $this->upload->update([
                'status' => 'completed',
                'processed_rows' => $processedRows,
                'skipped_rows' => $skippedRows,
                'duplicate_rows' => $duplicateRows,
            ]);
        } catch (\Exception $e) {
            $this->upload->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function processChunk($chunkRecord, $data)
    {
        $model = $this->upload->data_type === 'email' ? new Company() : new WhatsappData();
        $table = $model->getTable();

        $inserted = 0;
        foreach ($data as $row) {
            try {
                // Add upload_id to each row
                $row['upload_id'] = $this->upload->id;
                
                $existing = null;
                if ($this->upload->data_type === 'email') {
                    $existing = Company::where('email_address', $row['email_address'] ?? '')->first();
                } else {
                    $existing = WhatsappData::where('mobile_number', $row['mobile_number'] ?? '')->first();
                }

                if (!$existing) {
                    $model->create($row);
                    $inserted++;
                }
            } catch (\Exception $e) {
                \Log::error('Error processing row: ' . $e->getMessage());
            }
        }

        $chunkRecord->update([
            'status' => 'completed',
            'processed_rows' => $inserted
        ]);
    }
}
