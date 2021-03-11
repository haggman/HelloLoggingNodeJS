# Load Generator

This is a basic containerized application that uses Locust to generate load on the main Hello Logging Nodejs app's /random-error route, by default. It assumes that you have already deployed HelloLoggingJS to the same Kubernetes cluster where you will deploy the load generator. It will generate a starting load of approximately 30 requests per second. 

## Building and deploying the load generator to Container Registry

The easiest way to build the load generation container is to use the supplied `buildLoadGeneContainer.sh` script. The script will prompt for version number, 1.0 will be used by default.

1. Run `buildLoadGeneContainer.sh`, provide a version number (1.0?).

``` bash
sh buildLoadGeneContainer.sh
```

2. At the end of the output, Cloud Build will display the path to the newly generated container. It should look like: "gcr.io/some-project-name/load-generator:1.0". Copy the path. 

3. Open the `k8s-loadgen.yaml` file for editing. Update the container image path using the value you just copied.

4. Deploy the load generator to Kubernetes.

``` bash
kubectl apply -f k8s-loadgen.yaml
```

## Customizing load generation

By default, the load generator throws load on the `/random-error` path of the HelloLoggingJS application. In the `k8s-loadgen.yaml` file, you can change the `APP_ROUTE` env variable to redirect traffic to a different route. You can also change the simulated number of `USERS`, and the `replicas` to increase or decrease the load. Each user generates a request per second. If you like, you can also update the `FRONTEND_ADDR` to throw load on a totally different application. 
