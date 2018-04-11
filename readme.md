# Chand
"Chand" means "how much" in Farsi. 
This is a simple application to keep track of gold / currency prices in Iran.

We use this url to retrieve coin prices for today:
http://platform.tgju.org/fa/api/webservice-snippet/?token=webservice&items=sekeb,sekee,nim,rob,gerami&opts=diff,time&placeholder=tgju-data&hostname=
which in turn was extracted from this one:
http://www.tgju.org/webservice/global/snippet-loader.php?token=webservice&items=sekeb,sekee,nim,rob,gerami&opts=diff,time&placeholder=tgju-data

TODO: use this to add currency prices:
http://www.tgju.org/?act=sanarateservice&client=tgju&noview&type=json
