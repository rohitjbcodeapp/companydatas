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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email_address')->nullable()->index('idx_email');
            $table->string('personal_emails_0')->nullable();
            $table->string('personal_emails_1')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('job_title')->nullable();
            $table->string('seniority_level')->nullable();
            $table->text('headline')->nullable();
            $table->string('main_department')->nullable();
            $table->string('main_function')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('company_name')->nullable()->index('idx_company');
            $table->string('company_domain')->nullable();
            $table->string('company_website')->nullable();
            $table->string('company_phone')->nullable();
            $table->integer('company_founded_year')->nullable();
            $table->decimal('company_growth_12m', 10, 4)->nullable();
            $table->string('company_linkedin_url')->nullable();
            $table->string('email_domain_catchall')->nullable();
            $table->string('email_status')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('name')->nullable()->index('idx_name');
            $table->string('organization_angellist_url')->nullable();
            $table->string('organization_facebook_url')->nullable();
            $table->string('organization_primary_phone')->nullable();
            $table->string('organization_twitter_url')->nullable();
            $table->string('organization_website_url')->nullable();
            $table->string('organization_phone')->nullable();
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
        Schema::dropIfExists('companies');
    }
};
