# fixed-list

A list of fixed-height children view

## Usage 
the child view's height must be fixed,otherwise can not calculate the total of height.

### Initialize

```
// the parentNode of all the children view's container
fixList = new FixedList(parentNode);
// the first param is cols, and the second param is the number of children view you want to show
fixList.initList(2, 8);
```

### Refresh your datas
```
// datas can be object, array and string.
fixList.refreshData(datas);
```

### Refresh the data partly
```
fixList.refreshPart(data,1,10,20);
```
