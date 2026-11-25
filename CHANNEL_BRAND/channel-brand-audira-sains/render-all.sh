#!/usr/bin/env bash
# Render every AUDIRA Sains channel asset. Run from this folder: bash render-all.sh
set -e
cd "$(dirname "$0")"
r(){ node render.cjs "$@"; echo "ok $2"; }
r src/banner.html  banner-youtube-2560x1440.png 2560 1440 "?w=2560&h=1440&s=1"
r src/banner.html  header-x-1500x500.png        1500 500  "?w=1500&h=500&s=0.6&tags=0"
r src/banner.html  cover-facebook-1640x624.png  1640 624  "?w=1640&h=624&s=0.74&tags=0"
r src/profile.html profile-800x800.png          800  800
for k in biologi fisika bumi astronomi sekolah; do
  r src/highlight.html "highlight-$k-1080x1920.png" 1080 1920 "?k=$k"
done
# YouTube video watermark (150x150) from the profile picture
ffmpeg -y -loglevel error -i profile-800x800.png -vf scale=150:150:flags=lanczos watermark-150x150.png && echo "ok watermark-150x150.png"
