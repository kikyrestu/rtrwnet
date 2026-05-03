<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaBroadcastLog extends Model
{
    protected $table = 'wa_broadcast_logs';
    protected $guarded = [];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function template()
    {
        return $this->belongsTo(WaTemplate::class, 'template_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
