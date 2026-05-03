<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $guarded = [];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }

    /**
     * Auto-generate ticket number: TKT-202605-0001
     */
    public static function generateNumber(): string
    {
        $prefix = 'TKT-' . now()->format('Ym');
        $last = static::where('ticket_number', 'like', $prefix . '%')->orderByDesc('id')->first();
        $seq = $last ? (int) substr($last->ticket_number, -4) + 1 : 1;
        return $prefix . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
