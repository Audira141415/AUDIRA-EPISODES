# Usage: bash project/sheet.sh <stillsDir> <out.jpg>   (copies to seq_%02d because ffmpeg glob fails on Windows)
set -e
d="$1"; out="$2"; tmp="$d/_seq"; rm -rf "$tmp"; mkdir -p "$tmp"; i=1
for f in $(ls "$d"/s*.png | sort -V); do cp "$f" "$tmp/seq_$(printf %02d $i).png"; i=$((i+1)); done
ffmpeg -y -loglevel error -i "$tmp/seq_%02d.png" -vf "scale=240:427,tile=7x2:padding=4" -frames:v 1 "$out"
rm -rf "$tmp"; echo "$out"
