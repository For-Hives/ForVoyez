-- Index the existing dashboard filters and chronological account queries.
CREATE INDEX "Token_userId_expiredAt_idx" ON "Token"("userId", "expiredAt");
CREATE INDEX "Usage_userId_usedAt_idx" ON "Usage"("userId", "usedAt");
CREATE INDEX "Usage_userId_used_idx" ON "Usage"("userId", "used");
CREATE INDEX "Subscription_userId_status_renewsAt_idx" ON "Subscription"("userId", "status", "renewsAt");
