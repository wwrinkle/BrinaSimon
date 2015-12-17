# BrinaSimon.com

[BrinaSimon.com](http://www.brinasimon.com/)

Another website for a freelance musician, this time built in the LAMP stack. This site features an Admin Portal for the owner to make changes, update certain sections and upload media.

## Front End

AngularJS app. Custom built HTML5 audio player. All performances are sorted into upcoming and past groups programmatically.

## Admin Portal and Back End

Performances, projects, images, videos and slides can all be edited via the Admin Portal. Essentially one long, password protected form. Users can make edits to any entry, add new entries and upload pictures and audio. Media is uploaded via `audio-upload.php` and `image-upload.php` and stored in the public folder (img and video). All other data is uploaded via `json-post.php` as json files in the `data` folder outside of this file tree. This folder is reached via a symlink created on line 4 of `.openshift/action_hooks/deploy`.

The mail from the contact form is handled via `process.php` and makes use of `PHPMailer`.

## Thanks for taking a look

Any comments, criticisms and suggestions are welcomed.

Best,

Willie