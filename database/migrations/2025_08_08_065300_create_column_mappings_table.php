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
        Schema::create('column_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('upload_id');
            $table->string('source_column')->nullable();
            $table->string('target_column')->nullable();
            $table->boolean('is_selected')->default(true);
            $table->integer('column_order')->nullable();
            $table->timestamps();

            $table->index('upload_id', 'idx_upload');
            $table->foreign('upload_id')->references('id')->on('upload_history')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('column_mappings');
    }
};
