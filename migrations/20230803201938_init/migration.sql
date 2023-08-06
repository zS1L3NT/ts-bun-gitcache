-- CreateTable
CREATE TABLE "Project" (
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "tags" STRING[],

    CONSTRAINT "Project_pkey" PRIMARY KEY ("title")
);
