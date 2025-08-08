<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('column_mappings', 'upload_id')) {
            Schema::table('column_mappings', function (Blueprint $table) {
                $table->unsignedBigInteger('upload_id')->after('id');
                $table->index('upload_id', 'idx_upload');
                $table->foreign('upload_id')->references('id')->on('upload_history')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('column_mappings', 'upload_id')) {
            Schema::table('column_mappings', function (Blueprint $table) {
                $table->dropForeign(['upload_id']);
                $table->dropIndex('idx_upload');
                $table->dropColumn('upload_id');
            });
        }
    }
};
