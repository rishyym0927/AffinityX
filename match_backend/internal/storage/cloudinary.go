package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryClient struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinary() (*CloudinaryClient, error) {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		return nil, err
	}
	return &CloudinaryClient{cld}, nil
}

// Upload uploads image to Cloudinary and returns the public URL
func (c *CloudinaryClient) Upload(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader, userID int64) (string, error) {
	folder := os.Getenv("CLOUDINARY_UPLOAD_FOLDER")
	if folder == "" {
		folder = "uploads"
	}

	uploadParams := uploader.UploadParams{
		Folder: fmt.Sprintf("%s/user_%d", folder, userID),
		PublicID: fileHeader.Filename[:len(fileHeader.Filename)-len(filepath.Ext(fileHeader.Filename))],
	}

	res, err := c.cld.Upload.Upload(ctx, file, uploadParams)
	if err != nil {
		return "", err
	}
	return res.SecureURL, nil
}
