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
        Schema::create('whatsapp_data', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('linkedin_url');
            $table->string('mobile_number')->nullable();
            $table->bigInteger('review_count')->nullable();
            $table->decimal('rating', 4, 2)->nullable();
            $table->string('category')->nullable();
            $table->string('address')->nullable();
            $table->string('website')->nullable();
            $table->string('plus_code')->nullable();
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->string('instagram_profile')->nullable();
            $table->string('facebook_profile')->nullable();
            $table->string('twitter_profile')->nullable();
            $table->unsignedBigInteger('upload_id')->nullable()->index('idx_upload');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('upload_id')
                ->references('id')
                ->on('upload_history')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_data');
    }
};
