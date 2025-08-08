<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadHistory extends Model
{
    public function chunks()
    {
        return $this->hasMany(UploadChunk::class, 'upload_id');
    }

    public function mappings()
    {
        return $this->hasMany(ColumnMapping::class, 'upload_id');
    }
}
