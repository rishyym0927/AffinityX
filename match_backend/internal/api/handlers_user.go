package api

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// getProfile retrieves a user profile by ID
func (s *Server) getProfile(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := s.repo.GetUser(r.Context(), id)
	if err != nil {
		s.errorJSON(w, "user not found", http.StatusNotFound)
		return
	}

	s.responseJSON(w, user, http.StatusOK)
}

// uploadUserImages handles multiple image uploads for a user
func (s *Server) uploadUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	// Parse multipart form
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		s.errorJSON(w, "invalid form data", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["images"]

	// Validate files
	if len(files) == 0 {
		s.errorJSON(w, "no files provided", http.StatusBadRequest)
		return
	}

	if len(files) > maxImagesUpload {
		s.errorJSON(w, fmt.Sprintf("maximum %d images allowed", maxImagesUpload), http.StatusBadRequest)
		return
	}

	// Upload images
	uploaded, err := s.processImageUploads(r, uid, files)
	if err != nil {
		s.errorJSON(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{
		"message":  "upload successful",
		"uploaded": uploaded,
	}, http.StatusOK)
}

// listUserImages retrieves all images for the authenticated user
func (s *Server) listUserImages(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	imgs, err := s.repo.GetUserImages(r.Context(), uid)
	if err != nil {
		s.errorJSON(w, "failed to fetch images", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]any{"images": imgs}, http.StatusOK)
}

// setPrimaryImage sets an image as the user's primary profile picture
func (s *Server) setPrimaryImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid image ID", http.StatusBadRequest)
		return
	}

	if err := s.repo.SetPrimaryImage(r.Context(), id, uid); err != nil {
		s.errorJSON(w, "failed to set primary image", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "primary image set"}, http.StatusOK)
}

// deleteUserImage deletes a user's image
func (s *Server) deleteUserImage(w http.ResponseWriter, r *http.Request) {
	uid := userIDFromCtx(r)

	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		s.errorJSON(w, "invalid image ID", http.StatusBadRequest)
		return
	}

	if err := s.repo.DeleteUserImage(r.Context(), id, uid); err != nil {
		s.errorJSON(w, "failed to delete image", http.StatusInternalServerError)
		return
	}

	s.responseJSON(w, map[string]string{"message": "deleted"}, http.StatusOK)
}

// processImageUploads handles multiple image uploads
func (s *Server) processImageUploads(r *http.Request, uid int64, files []*multipart.FileHeader) ([]string, error) {
	var uploaded []string

	for _, fh := range files {
		f, err := fh.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open file: %w", err)
		}
		defer f.Close()

		// Upload to Cloudinary
		url, err := s.cloudinary.Upload(r.Context(), f, fh, uid)
		if err != nil {
			return nil, fmt.Errorf("upload failed: %w", err)
		}

		// Save to database
		if err := s.repo.AddUserImage(r.Context(), uid, url); err != nil {
			return nil, fmt.Errorf("failed to save image: %w", err)
		}

		uploaded = append(uploaded, url)
	}

	return uploaded, nil
}
