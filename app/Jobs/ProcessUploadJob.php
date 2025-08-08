<?php

namespace App\Jobs;

use App\Imports\UploadChunkImport;
use App\Models\UploadHistory;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ProcessUploadJob implements ShouldQueue
{
    use Queueable;
    use Dispatchable, Queueable, SerializesModels;

    protected $upload;

    /**
     * Create a new job instance.
     */
    public function __construct(UploadHistory $upload)
    {
        $this->upload = $upload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->upload->update(['status' => 'processing']);
        try {
            $filePath = storage_path('app/uploads/' . $this->upload->filename);
            Excel::import(new UploadChunkImport($this->upload->id), $filePath);
            $this->upload->update(['status' => 'completed']);
        } catch (\Exception $e) {
            $this->upload->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            throw $e;
        }
    }
}
