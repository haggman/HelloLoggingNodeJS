# Hello Logging NodeJS
This is a basic Hello World example written in NodeJS which uses Winston and the GCP plugin for Winston to do some basic logging in GCP

## Load the dependencies and test locally

Install the dependencies

```
npm install
```

Start the server

```
npm start
```

Test by visiting [http://localhost:8080](http://localhost:8080)

If it's working, shut down the server (ctrl-c)

## Building and deploying to Container Registry

Use Cloud Build to build the Docker image and push to GCR

```
export PROJECT=$(gcloud config list --format 'value(core.project)')
gcloud builds submit . --tag gcr.io/$PROJECT/hello-logging
```

## Running the app in Cloud Run
Now create a new Cloud Run app named *hello-logging* based on the just pushed image

```
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```

## Rebuilding the Cloud Run app
Remember, if you change the code you'll have to save the change, Cloud Build the image into the GCR, and push a new Cloud Run revision. This command will fail if the $PROJECT env variable isn't set, FYI.

```
gcloud builds submit --tag gcr.io/$PROJECT/hello-logging
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```

## Deploying to App Engine

There's already an `app.yaml` file so no need to create one yourself. Create the App Engine app (if needed):

```
gcloud app create
```

Then deploy the applition to it:

```
gcloud app deploy
```

## GKE

Note, there's also a `k8sapp.yaml` if you'd like to deploy the app to GKE as a Deployment, and build a LoadBalancer for it. You will need to edit the file before applying to set the propper path to the container in GCR
