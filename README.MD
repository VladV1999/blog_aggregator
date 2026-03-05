Hello and Greetings to everyone reading this!
This is my own personal blog aggregator that scrapes from the web
and posts feeds, titles, and follows!
------------------------------------------------------------------------
To launch this, or to have a proper configuration,
you need to set a .gatorconfig.json file right in your root
some commands use the current user logged in, so it's quite important you do that!
speaking of commands!
-----------------------------------------------------------------------
To start, since I am using node, you would use
npm run start <command> <optional args>
Here is a list of comprehensive commands and what they do!
login -- This command sets your currentUser in your .gatorconfig.json
to be the provided user. You must pass the name of the person you wish to register!

register -- This simply registers a user in the database!
You would also provide the name to be registered.

reset -- Since cascade is here, and orphaned records are scorned upon
this wipes the user database, and therefore, all the other ones. 
no optional args needed

users -- this simply lists all the users in the database! no optional args
needed

agg -- you must provide a duration, in a single arg like
1m, 1h, 1s (please don't do one second, do not DOS anyone)
this will scrape the feeds from the database and show them to you!

addfeed -- you must provide two arguments here! the title of the feed,
and the url of the feed! this will add a feed to the database, which will,
in time, with the agg command, show you potential updates!

feeds -- no optional args needed, this will simply list all the feeds 
in the database

follow -- your current user (the one in .gatorconfig) will follow a 
certain feed, and you will be able to see which ones, with the next command

following -- will display all the feeds that the current user is following!

unfollow -- will unfollow a feed, but you must provide a url to unfollow!

browse -- will provide all the posts that the current user is following,
with more detailed information such as titles, and short descriptions