read -p "Load Generator version (e.g. 1.0)? " version
version=${version:-1.0}
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/load-generator:$version