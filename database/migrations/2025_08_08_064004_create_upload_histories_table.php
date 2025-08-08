<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('upload_history', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_filename');
            $table->bigInteger('file_size')->nullable();
            $table->integer('total_rows')->nullable();
            $table->integer('processed_rows')->nullable();
            $table->integer('skipped_rows')->nullable();
            $table->integer('duplicate_rows')->nullable();
            $table->text('selected_columns')->nullable();
            $table->enum('data_type', ['email', 'whatsapp'])->default('email');
            $table->enum('file_type', ['excel', 'csv'])->default('excel');
            $table->enum('status', ['processing', 'chunked_processing', 'completed', 'failed'])->default('processing');
            $table->text('error_message')->nullable();
            $table->text('custom_text')->nullable();

            // New fields
            $table->string('apollo_url')->nullable();
            $table->string('custom_file_name')->nullable();
            $table->string('file_url')->nullable();


            $table->timestamps();
            $table->softDeletes();

            $table->index('status', 'idx_status');
            $table->index('created_at', 'idx_created');
            $table->index('deleted_at', 'idx_deleted');
            $table->index('file_type', 'idx_file_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_history');
    }
};
