-- CreateTable
CREATE TABLE "Project" (
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "topics" STRING[],

    CONSTRAINT "Project_pkey" PRIMARY KEY ("name")
);
