![alt text](https://raw.githubusercontent.com/mh-rafi/vrp-solver/master/vrp-thumbnail.jpg)

## Demo link
https://vrp-solver.herokuapp.com

vehicle routing problem is also known as Salesman traveling problem.
One vehicle will be able to supply the maximum amount of products to different locations by traveling minimum distance.

## HOW TO USE (INSTRUCTION)
### Step 1

login with your gmail ID. You can use this application without login. We recommend login before calculating route because you will have save option available if you login and you will able to save data to our database. You don’t have to select locations each time you leave or refresh UI.

### Step 2
Click on map and set a center location. A marker will appear on map and location address text will appear at right side of map.

### Step 3: 
Set vehicle capacity. Value must be numeric

### Step 4: 
click on map and set destinations. For each destination a marker will appear on map and an address text box with demand input field will appear under the map.

### Step 5: 
Set demand for each destination. Value must be numeric. Destination with zero value will be excluded from calculation.

### Step 6: 
Click on “Calculate Routes” button

### Step 7: 
Optimized routes will appear at the bottom of UI.

### Step 8: 
By clicking on “Get Direction” button route path will be displayed on map. It will also show total distance in kilometer.


This application has data export and import functionality. We can export a data set and import that when we need. This will be helpful when we need to keep track of data monthly/weekly basis.


## LIMITATIONS
* This application is only applicable when there is only one vehicle or all the vehicle with same capacity.

* Applicable when this is a centralized return center based system.

* When there is more than 6 destination, the rest of the interdistance matrix must be filled up manually.

    

