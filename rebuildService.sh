export PROJECT=$(gcloud config list --format 'value(core.project)')
gcloud builds submit --tag gcr.io/$PROJECT/hello-logging
gcloud run deploy hello-logging --image gcr.io/$PROJECT/hello-logging --region us-central1 --platform managed --quiet --allow-unauthenticated --concurrency 5
