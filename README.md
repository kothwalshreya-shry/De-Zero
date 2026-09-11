1. Open Eclipse

Then:

File → Import

2. Select:

Maven → Existing Maven Projects

→ Next

3. Browse to the HMS folder you cloned

Select:

SE-Practice
   └── HMS   ← select THIS folder

Eclipse should automatically detect:

pom.xml

4. Tick the pom.xml project → Finish

Wait for Eclipse to finish importing/dependency downloading.

Then in Eclipse

On the left in Project Explorer, you should see the HMS project.

Expand it:

HMS
├── src
├── target       (may appear after build)
├── pom.xml      ← IMPORTANT
└── ...
Now Maven build

Right-click HMS project → Run As → Maven clean

Then:

Right-click HMS → Run As → Maven install

Or, if Eclipse gives you Maven build..., you can enter:

clean install

The goal is:

BUILD SUCCESS
