# Running without Installation (Supports only Hard-Coded Maps)

Use these instructions to run the simulator on a single machine using one of
the hard-coded maps.

1.  In `js/index.js`, change `HARD_CODED_MAP` to whichever of the hard-coded
    maps you want to use.  By default, the code loads `AVERY_MAP`, a small map
    centered on Avery Hall, University of Nebraska—Lincoln, NE, USA.  Other
    maps are listed in `js/data.js`.

2.  To run the app, open the file `index.html` in a web browser.

3.  To run the unit tests, open the file `unit_tests/unit_tests.html` in a web
    browser.

# Running with Installation on a SOFT 260 VM (Supports Maps from the Internet)

Use these instructions to host the simulator on a SOFT 260 VM and use maps
loaded from the internet.

1.  Install `libspatialindex`:

    1.  Download the `libspatialindex` source code as a tarball:

        ````
        $ wget 'http://download.osgeo.org/libspatialindex/spatialindex-src-1.8.5.tar.gz'
        ````

    2.  Extract the source code from the tarball:

        ````
        $ tar xvfz spatialindex-src-1.8.5.tar.gz
        ````

    3.  Change into the source-code directory:

        ````
        $ cd spatialindex-src-1.8.5/
        ````

    4.  Configure the build system for the VM:

        ````
        $ ./configure
        ````

    5.  Build `libspatialindex`:

        ````
        $ make
        ````

    6.  Install `libspatialindex` for all users:

        ````
        $ sudo make install
        ````

    7.  Clean up the source code:

        ````
        $ cd ..
        $ rm -r spatialindex-src-1.8.5
        $ rm spatialindex-src-1.8.5.tar.gz
        ````

2.  Install GDAL:

    ````
    $ sudo apt-get install libgdal-dev
    ````

3.  Install `python-slugify` and `osmnx`:

    ````
    $ sudo pip3 install --upgrade python-slugify osmnx
    ````

4.  Reboot the VM (to guarantee that `ld` can find `libspatialindex`).

5.  Configure Apache's `mod_userdir` to allow CGI scripts:

    1.  Open the `mod_userdir` configuration file:

        ````
        $ kdesu kwrite /etc/apache2/mod_userdir.conf
        ````

    2.  Find the `Options` directive inside the block marked
        `<Directory /home/*/public_html>`.

    3.  Just after that directive, add the following lines at the same
        indentation level:

        ````
        Options +ExecCGI -Includes
        AddHandler cgi-script .cgi
        ````

    4.  Save and exit.

    5.  Restart Apache:

        ````
        $ sudo service apache2 restart
        ````

6.  In `js/index.js`, change `LOAD_MAPS_FROM_SERVER` from `false` to `true`.
    Change `SERVER_MAP_CENTER_ADDRESS` to the address you want the map centered
    on and `SERVER_MAP_RADIUS` to the distance the map should extend from that
    center.

7.  Symlink the project into your Apache user directory:

    ````
    $ mkdir -p ~/public_html
    $ ln -sT ~/git/soft260_project ~/public_html/soft260_project
    ````

8.  Make sure that the web server has permission to cache maps in a `data`
    folder:

    ````
    $ mkdir -p ~/public_html/soft260_project/server/data
    $ chmod 777 ~/public_html/soft260_project/server/data
    ````

9.  To allow access to the app from your laptop's browser (as opposed to the
    VM's browser), take the following steps:

    1.  In YaST, under "Firewall" → "Allowed Services", used the "Advanced"
    button to add `80` to the allowed TCP ports.  Then click "Ok", "Next", and
    "Finish" to apply your changes.

    2.  In VirtualBox, change the port forwarding of the OpenSUSE VM's NAT
    adapter so that TCP traffic on port 8080 is forwarded to port 80 of your
    OpenSUSE VM.  (You can leave the IP fields blank.)

10. To allow access to the app from other computers on the same network, open
    port 8080 on your laptop's firewall.  Use this option with care; while your
    have the port open and the VM running, anyone on the same network will be
    able to see (and possibly plagiarize) your source code.

11. To run the app, open on of the following URLs:

    *   <http://localhost/~cse/soft260_project/index.html> (from within your
        VM),
    *   <http://localhost:8080/~cse/soft260_project/index.html> (from your
        laptop browser), or
    *   <http://IP_ADDRESS:8080/~cse/soft260_project/index.html> where
        `IP_ADDRESS` is your laptop's IP address (from a browser on another
        machine).

12. To run the unit tests, open a similar URL, but replace `index.html` with
    `unit_tests/unit_tests.html`.
