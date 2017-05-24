var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// GET /posts - Return a list of posts and associated metadata.
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// POST /posts - create a new post
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// GET /posts/:id - return an individual post with associated comments
router.get('/posts/:post', function(req, res) {

  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// PUT /posts/:id/upvote - upvote a post, notice we use the post ID in the URL
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

// POST /posts/:id/comments - add a new comment to a post by ID
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// GET /posts/:post/comments - Return a list of comments associated to a post.
router.get('/posts/:post/comments', function(req, res, next) {

  var query = Comment.find({'post': req.post});

  query.exec(function (err, comments){
    if (err) { return next(err); }
    if (!comments) { return next(new Error('can\'t find comments for the post')); }

    res.json(comments);
  });
});

// POST /posts/:post/comments - create a new comment
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post){
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// GET /posts/:post/comments/:comment - return an individual comment
router.get('/posts/:post/comments/:comment', function(req, res) {
  res.json(req.comment);
});

// PUT /posts/:id/comments/:id/upvote - upvote a comment
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

/**
 *  Now when we define a route URL with :post in it, this function will be run first. Assuming the :post parameter
 *  contains an ID, our function will retrieve the post object from the database and attach it to the req object after
 *  which the route handler function will be called.
*/
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

// Retrieve comments specified by the :comment route parameter.
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});