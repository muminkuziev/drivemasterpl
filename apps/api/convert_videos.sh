#!/bin/bash
FFMPEG="/c/Users/ggani/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
cd "/c/Projects/DriveMaster/apps/api/media/theory"
total=$(ls *.wmv 2>/dev/null | wc -l)
count=0
for f in *.wmv; do
  [ -e "$f" ] || continue
  out="${f%.wmv}.mp4"
  if [ -f "$out" ]; then continue; fi
  "$FFMPEG" -y -loglevel error -i "$f" -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart "$out"
  count=$((count+1))
  if [ $((count % 50)) -eq 0 ]; then
    echo "Progress: $count / $total converted"
  fi
done
echo "DONE. Converted $count files."
