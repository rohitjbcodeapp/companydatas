<?php

namespace App\Imports;

use App\Models\UploadChunk;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class UploadChunkImport implements ToCollection
{

    protected $uploadId;
    protected $chunkCounter = 0;

    public function __construct(int $uploadId)
    {
        $this->uploadId = $uploadId;
    }

    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        $this->chunkCounter++;
        UploadChunk::create([
            'upload_id'  => $this->uploadId,
            'chunk_id'   => $this->chunkCounter,
            'chunk_data' => json_encode($rows->toArray()),
        ]);
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
