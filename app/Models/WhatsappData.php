<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappData extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function upload()
    {
        return $this->belongsTo(UploadHistory::class, 'upload_id');
    }
}
