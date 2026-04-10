package com.cherryskincare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private static final long WINDOW_SECONDS = 60;

    @Value("${auth.rate-limit-per-minute:30}")
    private int maxRequestsPerMinute;

    private final Map<String, Deque<Instant>> requestsByKey = new ConcurrentHashMap<>();

    public boolean tryConsume(String key) {
        if (key == null || key.trim().isEmpty()) {
            return true;
        }

        Instant now = Instant.now();
        Deque<Instant> bucket = requestsByKey.computeIfAbsent(key, k -> new ArrayDeque<>());

        synchronized (bucket) {
            Instant cutoff = now.minusSeconds(WINDOW_SECONDS);
            while (!bucket.isEmpty() && bucket.peekFirst().isBefore(cutoff)) {
                bucket.pollFirst();
            }

            if (bucket.size() >= maxRequestsPerMinute) {
                return false;
            }

            bucket.addLast(now);
            return true;
        }
    }
}
