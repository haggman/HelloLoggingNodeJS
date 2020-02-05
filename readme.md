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
gcloud builds submit --tag gcr.io/$PROJECT/hello-logging
```

Now create a new Cloud Run app named *hello-logging* based on the just pushed image

```
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```

## Rebuilding the app
Remember, if you change the code you'll have to save the change, Cloud Build the image into the GCR, and push a new Cloud Run revision

```
gcloud builds submit --tag gcr.io/$PROJECT/hello-logging
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated
```
