# Hello Logging NodeJS

This is a basic Hello World example application written in NodeJS and designed to explore some of Google's Operations Suite features. You can run it in App Engine, Kubernetes Engine, or Cloud Run.

Note: If running the example in a GKE cluster, you will need to enable full security scope access for the cluster when creating, or add appropriate roles to your cluster Service Account, or you will receive errors from some of the operations related agents.

## Load the dependencies and test locally

Install the dependencies

``` bash
npm install
```

Start the server

``` bash
npm start
```

Test by visiting [http://localhost:8080](http://localhost:8080)

If it's working, shut down the server (ctrl-c)

## Building and deploying to Container Registry

Use Cloud Build to build the Docker image and push to GCR

``` bash
export PROJECT=$(gcloud config list --format 'value(core.project)')
gcloud builds submit . --tag gcr.io/$PROJECT/hello-logging
```

## Running the app in Cloud Run

Now create a new Cloud Run app named *hello-logging* based on the just pushed image

``` bash
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```

## Rebuilding the Cloud Run app

Remember, if you change the code you'll have to save the change, Cloud Build the image into the GCR, and push a new Cloud Run revision. This command will fail if the $PROJECT env variable isn't set, FYI.

``` bash
gcloud builds submit --tag gcr.io/$PROJECT/hello-logging
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```

## Deploying to App Engine

There's already an `app.yaml` file so no need to create one yourself. Create the App Engine app (if needed):

``` bash
gcloud app create
```

Then deploy the application to it:

``` bash
gcloud app deploy
```

## GKE

If you'd like to deploy to GKE, make sure you have the appropriate permissions enabled on the cluster (see note at top of this file). There's a `k8sapp.yaml` containing configurations to create a Deployment, and build a LoadBalancer for it. You will need to edit the file before applying to set the proper path to the container in GCR. The simply apply the file:

``` bash
kubectl apply -f k8sapp.yaml
```
