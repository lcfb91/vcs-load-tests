# Run 

## Upload

```
k6 run --vus 5 --duration 30s src/assets-api.js  
```

## List all files

```
k6 run --rps 10 --vus 10 --duration 50s src/assets-api-list.js     
```