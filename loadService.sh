#Don't leave the square brackets when updating the following
URL=[URL here] 
#Do a sanity check. If the above URL is dropped into the below
#command, does the resulting URL make sense? Work? 
#Have too many slashes?
ab -n 100000 -c 100 $URL/ 