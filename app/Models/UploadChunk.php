<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadChunk extends Model
{
    protected $fillable = ['upload_id', 'chunk_id', 'chunk_data', 'status', 'processed_rows'];

    public $timestamps = true;

    public function upload()
    {
        return $this->belongsTo(UploadHistory::class, 'upload_id');
    }
}
