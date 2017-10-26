Prototype Public Transit Simulator
==================================

In the prototype's current state, the map, number of passengers, initial
simulation speed, etc., are all hard-coded, and passengers choose destinations
at random.  Routes are required to be either simple or two-vertex cycles.  No
statistics are collected yet.

There are a number of outstanding bugs, some of which are noted below.

The simulation is also very processor-intensive.  It's a good idea to pause it
or even close it when you are not using it so that it's not taking up all of
your CPU.

Looking Around
--------------

*   Left-click and drag to move the map.
*   Scroll to zoom in or out.

Changing the Simulation Speed
---------------------------

*   Click the turtle icon one or more times to slow the simulation down.
*   Click the rabbit icon one or more times to speed the simulation up.
*   Click the pause icon to pause or unpause the simulation.

Selecting Objects
-----------------

*   Click on a passenger to select them.
*   Click on a bus to select it.
*   Click on a route to select it.  If the route overlaps another route, you
    might have to click several times to select the right route.
*   Click on the grass to select nothing.

Adding Routes
-------------

*   Select nothing and then click "Add Route" to add a route:
    *   Start the route by clicking a vertex.
    *   Click another, unhighlighted vertex to extend the route (if possible).
        (This part of the code is a little buggy and sometimes extends the
        route in strange, roundabout ways.)
    *   Click a highlighted vertex to retract the route.
    *   Click the original vertex to complete the route (if possible) and then
        automatically select the completed route.

Changing Routes
---------------

*   Select a route and then click "Change Route" to change it:
    *   Start the new portion of the route by clicking a vertex on the route.
    *   Click another, unhighlighted vertex to extend the new portion (if
        possible).  (This part of the code is a little buggy and sometimes
        extends the new portion in strange, roundabout ways.)
    *   Click a highlighted vertex to retract the new portion.
    *   Click elsewhere on the route to complete the change (if possible).

Retiring Routes
----------------

*   Select a route and then click "Retire Route" to retire it.

Adding Buses
------------

*   Select a route and then click "Add Buses" to add buses:
    *   Click on the route to make a new bus appear.
    *   Click "Done" to stop adding buses.

Stopping Buses
--------------

*   Select a bus and click "Stop Bus" to stop it.
