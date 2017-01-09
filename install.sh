# I'm making this script because it was oddly difficult to set up (lots of errors, missing dependencies, etc), so I figured I might as well have a script to do it for anyone who doesn't want to do all the dirty work.

clear
echo "Welcome to the tlnccuwagnf (tulun) installer!";
echo "This may take up to 3 minutes...";

exec 2>/dev/null # We don't need to see all the junky output it shows.
sleep 4;
clear;

echo "Updating package headers...";
sudo apt-get update >/dev/null;
echo "Installing/Updating npm...";
sudo apt-get install npm >/dev/null; # will skip if already installed...
echo "Installing/Updating nodejs...";
sudo apt-get install nodejs >/dev/null; # also will skip if already installed...
echo "Clearing npm cache...";
sudo npm cache clean -f >/dev/null;
echo "Installing/Updating n...";
sudo npm install -g n >/dev/null;
echo "Installing/Updating nearley...";
sudo npm install -g nearley >/dev/null;
echo "Installing/Updating tlnccuwagnf...";
sudo npm install -g tlnccuwagnf >/dev/null;

clear;
sleep 1;

echo "Congrats! tlnccuwagnf (tulun) was successfully installed!";
tulun -v;
