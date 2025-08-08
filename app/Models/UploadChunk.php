<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadChunk extends Model
{
    protected $fillable = ['upload_id', 'chunk_id', 'chunk_data'];

    public function upload()
    {
        return $this->belongsTo(UploadHistory::class, 'upload_id');
    }
}
