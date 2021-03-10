gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/hello-logging:1.0
gcloud run deploy hello-logging --image gcr.io/$GOOGLE_CLOUD_PROJECT/hello-logging:1.0 --region us-central1 --platform managed --quiet --allow-unauthenticated --concurrency 5 --labels stage=dev,department=training
