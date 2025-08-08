<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadHistory extends Model
{
    use HasFactory;

    protected $table = 'upload_history'; 
    
    protected $fillable = [
        'filename',
        'original_filename',
        'file_size',
        'data_type',
        'file_type',
        'status',
        'apollo_url',
        'custom_file_name',
        'file_url',
    ];

    public function chunks()
    {
        return $this->hasMany(UploadChunk::class, 'upload_id');
    }

    public function mappings()
    {
        return $this->hasMany(ColumnMapping::class, 'upload_id');
    }
}
