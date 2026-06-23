CREATE INDEX idx_threads_uid ON n_threads(n_uid);
CREATE INDEX idx_comment_tid_uid ON n_comment(n_tid, n_uid);
CREATE INDEX idx_tclist_tid_cid_type ON n_tclist(n_tid, n_cid, n_type);
CREATE INDEX idx_threads_like_tid_uid ON n_threads_like(n_tid, n_uid);
CREATE INDEX idx_user_like_tid_uid ON n_user_like(n_tid, n_uid);
CREATE INDEX idx_threads_buy_tid_uid ON n_threads_buy(n_tid, n_uid);
CREATE INDEX idx_payorder_paytime_type ON n_payorder(n_paytime, n_type);
CREATE INDEX idx_medal_log_uid ON n_medal_log(n_uid);
CREATE INDEX idx_activity_checkin_log_uid ON n_activity_checkin_log(n_uid);
