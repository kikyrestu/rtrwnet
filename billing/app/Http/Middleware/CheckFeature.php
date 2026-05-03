<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\FeatureFlag;

class CheckFeature
{
    /**
     * Handle an incoming request.
     * Blocks access to routes if the associated feature flag is disabled.
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (!FeatureFlag::isEnabled($feature)) {
            return response()->json([
                'message' => 'Fitur ini sedang dinonaktifkan oleh administrator.',
                'feature' => $feature,
            ], 403);
        }

        return $next($request);
    }
}
