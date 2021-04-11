# TranscriptCollect

A node.js app designed to collect and process the captions and the dislikes & likes of a video. 

## Get Started

1. Clone the repo.
2. Run `npm i`.
3. Sign up for a Google Cloud account. 
4. Create a service account. 
5. Get the secrets as a .json file and save it to the root of the repo.
6. You can either

    a. Create an .env file:
    ```sh .env
        SECRET_FILE=<name of your services account file here with .json>
    ```
    ```sh env
    #EXAMPLE
    SECRET_FILE="service_account.json"
    ```

    b. Rename your file from **step 4** to `service_account.json`.
7. Create a folder to store your caption information. (See below folder as an example.)
    > a. For optimal results with the sister repo, format your folders like below:
    ```
        /PARENT_FOLDER/
            TRANSCRIPTS/
                JSON/
                TEXT/
                youtube_vids.json
            TranscriptCollect/
            TranscriptNLP/
    ```
8. Create a file named `youtube_vids.json` inside the folder **you created in step 6** and put all of your videos you'd like to capture information about. Be sure to follow the same structure as the example file. 
9. Run `npm run start`. 