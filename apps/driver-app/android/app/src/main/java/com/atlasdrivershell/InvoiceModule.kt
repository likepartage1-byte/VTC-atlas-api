package com.atlasdrivershell

import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.os.StrictMode
import android.media.MediaScannerConnection
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.io.File
import java.io.FileOutputStream

class InvoiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InvoiceModule"
    }

    private fun generatePdfDocument(details: ReadableMap): PdfDocument {
        val invoiceNumber = details.getString("invoiceNumber") ?: "INV-000000"
        val tripNumber = details.getString("tripNumber") ?: "AT-0000"
        val issuedAt = details.getString("issuedAt") ?: "14/07/2026"
        val passengerName = details.getString("passengerName") ?: "••••••••"
        val driverName = details.getString("driverName") ?: "Driver"
        val tripAmount = if (details.hasKey("tripAmount")) details.getDouble("tripAmount") else 0.0
        val atlasCommission = if (details.hasKey("atlasCommission")) details.getDouble("atlasCommission") else 0.0
        val netEarnings = if (details.hasKey("netEarnings")) details.getDouble("netEarnings") else 0.0
        val currency = details.getString("currency") ?: "MAD"

        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 standard size
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas

        val paint = Paint()
        val textPaint = Paint()

        // 1. Draw Clean White Background
        paint.color = Color.WHITE
        canvas.drawRect(0f, 0f, 595f, 842f, paint)

        // 2. Main Title
        textPaint.color = Color.rgb(30, 41, 59) // Slate 800
        textPaint.textSize = 22f
        textPaint.isFakeBoldText = true
        canvas.drawText("FACTURE / INVOICE", 40f, 70f, textPaint)

        textPaint.color = Color.rgb(100, 116, 139) // Slate 500
        textPaint.textSize = 10f
        textPaint.isFakeBoldText = false
        canvas.drawText("PLATEFORME ATLAS VTC", 40f, 90f, textPaint)

        // Dotted Horizontal Separator
        paint.strokeWidth = 1.5f
        paint.color = Color.rgb(203, 213, 225) // Slate 300
        canvas.drawLine(40f, 110f, 555f, 110f, paint)

        // Meta Information
        textPaint.color = Color.rgb(51, 65, 85) // Slate 700
        textPaint.textSize = 12f
        
        canvas.drawText("Numéro de Facture:  $invoiceNumber", 40f, 140f, textPaint)
        canvas.drawText("Référence Course:    #$tripNumber", 40f, 165f, textPaint)
        canvas.drawText("Date d'émission:      $issuedAt", 40f, 190f, textPaint)
        canvas.drawText("Chauffeur:            $driverName", 40f, 215f, textPaint)
        canvas.drawText("Passager:             $passengerName", 40f, 240f, textPaint)

        // Separator
        canvas.drawLine(40f, 265f, 555f, 265f, paint)

        // Table Header
        textPaint.isFakeBoldText = true
        textPaint.color = Color.rgb(15, 23, 42) // Slate 900
        canvas.drawText("DESCRIPTION", 40f, 295f, textPaint)
        canvas.drawText("MONTANT", 440f, 295f, textPaint)

        paint.strokeWidth = 2.0f
        paint.color = Color.rgb(15, 23, 42)
        canvas.drawLine(40f, 310f, 555f, 310f, paint)

        // Table Rows
        textPaint.isFakeBoldText = false
        textPaint.color = Color.rgb(51, 65, 85)

        // Row 1: Trip Amount
        canvas.drawText("Frais de transport (course #$tripNumber)", 40f, 340f, textPaint)
        val tripAmountStr = String.format("%.2f %s", tripAmount, currency)
        canvas.drawText(tripAmountStr, 440f, 340f, textPaint)

        // Row 2: Commission
        canvas.drawText("Commission Plateforme Atlas VTC (10%)", 40f, 370f, textPaint)
        val commissionStr = String.format("-%.2f %s", atlasCommission, currency)
        canvas.drawText(commissionStr, 440f, 370f, textPaint)

        // Line before total
        paint.strokeWidth = 1.5f
        paint.color = Color.rgb(203, 213, 225)
        canvas.drawLine(40f, 400f, 555f, 400f, paint)

        // Total Row
        textPaint.isFakeBoldText = true
        textPaint.color = Color.rgb(15, 23, 42)
        textPaint.textSize = 13f
        canvas.drawText("NET À PAYER (REVENUS GENERES)", 40f, 430f, textPaint)
        val netEarningsStr = String.format("%.2f %s", netEarnings, currency)
        canvas.drawText(netEarningsStr, 440f, 430f, textPaint)

        // Triple Line Page Finish
        paint.strokeWidth = 3.0f
        paint.color = Color.rgb(30, 41, 59)
        canvas.drawLine(40f, 450f, 555f, 450f, paint)

        // Support Details
        textPaint.textSize = 9f
        textPaint.color = Color.rgb(148, 163, 184) // Slate 400
        textPaint.isFakeBoldText = false
        canvas.drawText("Pour toute réclamation, veuillez contacter le support Atlas.", 40f, 520f, textPaint)
        canvas.drawText("Ce document tient lieu de justificatif de versement sur votre portefeuille.", 40f, 535f, textPaint)

        pdfDocument.finishPage(page)
        return pdfDocument
    }

    @ReactMethod
    fun generateInvoicePdf(details: ReadableMap, promise: Promise) {
        try {
            val invoiceNumber = details.getString("invoiceNumber") ?: "INV-000000"
            val pdfDocument = generatePdfDocument(details)
            
            var pdfFile: File
            
            // 1. Try public Download folder first
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            try {
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                pdfFile = File(downloadsDir, "$invoiceNumber.pdf")
                if (pdfFile.exists()) {
                    pdfFile.delete()
                }
                val outputStream = FileOutputStream(pdfFile)
                pdfDocument.writeTo(outputStream)
                outputStream.close()
            } catch (e: Exception) {
                // 2. Fallback to app External Files Directory under Download
                val fallbackDir = reactApplicationContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                fallbackDir?.mkdirs()
                pdfFile = File(fallbackDir, "$invoiceNumber.pdf")
                if (pdfFile.exists()) {
                    pdfFile.delete()
                }
                val outputStream = FileOutputStream(pdfFile)
                pdfDocument.writeTo(outputStream)
                outputStream.close()
            }
            
            pdfDocument.close()
            
            // 3. Scan path with MediaScannerConnection to register the file globally and make it show up in Files app
            MediaScannerConnection.scanFile(
                reactApplicationContext,
                arrayOf(pdfFile.absolutePath),
                arrayOf("application/pdf")
            ) { path, uri ->
                // Media scanning completed
            }

            promise.resolve(pdfFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun shareInvoice(details: ReadableMap, promise: Promise) {
        try {
            val invoiceNumber = details.getString("invoiceNumber") ?: "INV-000000"
            val pdfDocument = generatePdfDocument(details)
            
            // Save in App cache dir
            val cacheDir = reactApplicationContext.cacheDir
            cacheDir.mkdirs()
            val pdfFile = File(cacheDir, "$invoiceNumber.pdf")
            if (pdfFile.exists()) {
                pdfFile.delete()
            }
            val outputStream = FileOutputStream(pdfFile)
            pdfDocument.writeTo(outputStream)
            pdfDocument.close()
            outputStream.close()

            // Resolve URI using secure FileProvider authority
            val uri = FileProvider.getUriForFile(reactApplicationContext, "com.atlasdrivershell.fileprovider", pdfFile)
            
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            
            val chooser = Intent.createChooser(intent, "Share Invoice")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(chooser)
            
            promise.resolve(pdfFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message, e)
        }
    }
}
