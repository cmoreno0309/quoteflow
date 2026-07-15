-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('STANDARD', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('NEW', 'NEEDS_CLARIFICATION', 'UNKNOWN_PRODUCT', 'OUT_OF_STOCK', 'PENDING_APPROVAL', 'DRAFT_READY', 'REJECTED', 'ESCALATED');

-- CreateTable
CREATE TABLE "Producto" (
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" TEXT NOT NULL,
    "clienteRef" TEXT NOT NULL,
    "textoOriginal" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'NEW',
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);
