<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketComment;
use Carbon\Carbon;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['customer', 'assignee', 'creator']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', "%{$request->search}%")
                  ->orWhere('ticket_number', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', function ($cq) use ($request) {
                      $cq->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:gangguan,permintaan,informasi',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ticket = Ticket::create([
            'ticket_number' => Ticket::generateNumber(),
            'customer_id' => $request->customer_id,
            'subject' => $request->subject,
            'description' => $request->description,
            'category' => $request->category,
            'priority' => $request->priority,
            'assigned_to' => $request->assigned_to,
            'created_by' => auth()->id(),
            'status' => 'open',
        ]);

        return response()->json($ticket->load(['customer', 'assignee', 'creator']), 201);
    }

    public function show(Ticket $ticket)
    {
        return response()->json(
            $ticket->load(['customer', 'assignee', 'creator', 'comments.user'])
        );
    }

    public function update(Request $request, Ticket $ticket)
    {
        $request->validate([
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $data = $request->only(['status', 'priority', 'assigned_to', 'subject', 'description', 'category']);

        if (isset($data['status']) && in_array($data['status'], ['resolved', 'closed']) && !$ticket->resolved_at) {
            $data['resolved_at'] = Carbon::now();
        }

        $ticket->update($data);
        return response()->json($ticket->load(['customer', 'assignee', 'creator']));
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return response()->json(['message' => 'Tiket berhasil dihapus.']);
    }

    public function addComment(Request $request, Ticket $ticket)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function summary()
    {
        return response()->json([
            'total' => Ticket::count(),
            'open' => Ticket::where('status', 'open')->count(),
            'in_progress' => Ticket::where('status', 'in_progress')->count(),
            'resolved' => Ticket::where('status', 'resolved')->count(),
            'closed' => Ticket::where('status', 'closed')->count(),
            'critical' => Ticket::whereIn('status', ['open', 'in_progress'])->where('priority', 'critical')->count(),
        ]);
    }
}
