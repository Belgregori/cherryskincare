package com.cherryskincare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static class Attempt {
        int count;
        Instant lastAttemptAt;
        Instant lockedUntil;
    }

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    @Value("${auth.max-attempts:5}")
    private int maxAttempts;

    @Value("${auth.lockout-minutes:15}")
    private int lockoutMinutes;

    public boolean isLocked(String identifier) {
        String key = normalize(identifier);
        if (key == null) {
            return false;
        }

        Attempt attempt = attempts.get(key);
        if (attempt == null || attempt.lockedUntil == null) {
            return false;
        }

        Instant now = Instant.now();
        if (attempt.lockedUntil.isAfter(now)) {
            return true;
        }

        attempts.remove(key);
        return false;
    }

    public void recordFailedAttempt(String identifier) {
        String key = normalize(identifier);
        if (key == null) {
            return;
        }

        Instant now = Instant.now();
        attempts.compute(key, (k, attempt) -> {
            Attempt current = attempt != null ? attempt : new Attempt();
            if (current.lastAttemptAt == null ||
                Duration.between(current.lastAttemptAt, now).toMinutes() >= lockoutMinutes) {
                current.count = 0;
            }
            current.count += 1;
            current.lastAttemptAt = now;
            if (current.count >= maxAttempts) {
                current.lockedUntil = now.plus(Duration.ofMinutes(lockoutMinutes));
            }
            return current;
        });
    }

    public void resetAttempts(String identifier) {
        String key = normalize(identifier);
        if (key == null) {
            return;
        }
        attempts.remove(key);
    }

    private String normalize(String identifier) {
        if (identifier == null) {
            return null;
        }
        String trimmed = identifier.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
