<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ColumnMapping extends Model
{
    protected $fillable = ['upload_id', 'source_column', 'target_column', 'is_selected', 'column_order'];

    public function upload()
    {
        return $this->belongsTo(UploadHistory::class, 'upload_id');
    }
}
