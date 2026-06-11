#!/bin/bash
# InTouch backups — run from cron (see crontab):
#   backup_intouch.sh db      daily PostgreSQL dump, 14-day retention
#   backup_intouch.sh media   weekly tar of uploaded media, 28-day retention
#
# Restore a DB dump:
#   pg_restore --clean --if-exists -d intouch /home/ubuntu/backups/db/intouch-YYYY-MM-DD.dump
# Restore media:
#   tar xzf /home/ubuntu/backups/media/media-YYYY-MM-DD.tar.gz -C /
#
# NOTE: backups live on the same disk as the data. They cover bad
# migrations, accidental deletions and fat-fingered SQL — not a disk
# failure. Next step when the product grows: sync /home/ubuntu/backups
# to off-site storage (OVH Object Storage, rsync to another machine…).
set -euo pipefail

BACKUP_ROOT="/home/ubuntu/backups"
DATE=$(date +%F)

case "${1:-db}" in
  db)
    mkdir -p "$BACKUP_ROOT/db"
    pg_dump --format=custom --file="$BACKUP_ROOT/db/intouch-$DATE.dump" intouch
    find "$BACKUP_ROOT/db" -name 'intouch-*.dump' -mtime +14 -delete
    echo "$(date -Is) db backup OK: $(du -h "$BACKUP_ROOT/db/intouch-$DATE.dump" | cut -f1)"
    ;;
  media)
    mkdir -p "$BACKUP_ROOT/media"
    tar czf "$BACKUP_ROOT/media/media-$DATE.tar.gz" /var/www/intouch.ovh/mediafiles 2>/dev/null
    find "$BACKUP_ROOT/media" -name 'media-*.tar.gz' -mtime +28 -delete
    echo "$(date -Is) media backup OK: $(du -h "$BACKUP_ROOT/media/media-$DATE.tar.gz" | cut -f1)"
    ;;
  *)
    echo "usage: $0 {db|media}" >&2
    exit 1
    ;;
esac
