export interface AndroidFileRecord {
  path: string;
  language: string;
  content: string;
  description: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Root Gradle configuration with Kotlin & KSP plugins',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.ksp) apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Gradle repository settings',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "OfflineCalorieTracker"
include(":app")
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    language: 'toml',
    description: 'Version catalog for dependencies (Room, CameraX, ML Kit, Compose)',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
ksp = "1.9.23-1.0.20"
coreKtx = "1.13.1"
lifecycleRuntime = "2.7.0"
activityCompose = "1.9.0"
composeBom = "2024.05.00"
room = "2.6.1"
cameraX = "1.3.3"
mlkitBarcode = "17.2.0"
mlkitText = "16.0.0"
gson = "2.10.1"
junit = "4.13.2"
coroutinesTest = "1.8.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntime" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntime" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
camera-core = { group = "androidx.camera", name = "camera-core", version.ref = "cameraX" }
camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "cameraX" }
camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "cameraX" }
camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "cameraX" }
mlkit-barcode = { group = "com.google.mlkit", name = "barcode-scanning", version.ref = "mlkitBarcode" }
mlkit-text = { group = "com.google.android.gms", name = "play-services-mlkit-text-recognition", version.ref = "mlkitText" }
gson = { group = "com.google.code.gson", name = "gson", version.ref = "gson" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
kotlinx-coroutines-test = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-test", version.ref = "coroutinesTest" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'App-level build file with Room, CameraX, and Compose configurations',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "com.offlinetracker.calorie"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.offlinetracker.calorie"
        minSdk = 26 // Android 8.0 Oreo
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.13"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // Room Persistent Database
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    // CameraX for Live Barcode & Label Scanner
    implementation(libs.camera.core)
    implementation(libs.camera.camera2)
    implementation(libs.camera.lifecycle)
    implementation(libs.camera.view)

    // On-Device ML Kit
    implementation(libs.mlkit.barcode)
    implementation(libs.mlkit.text)

    // Local JSON Backup / Restore
    implementation(libs.gson)

    // Testing
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest with zero internet permission & Camera access',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Camera is only used on-demand when opening the live barcode/OCR scanner -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.CAMERA" />
    <!-- Notice: ZERO internet permission required. Pure offline operation. -->

    <application
        android:name=".CalorieTrackerApp"
        android:allowBackup="true"
        android:icon="@android:drawable/ic_menu_agenda"
        android:label="KcalTracker"
        android:roundIcon="@android:drawable/ic_menu_agenda"
        android:supportsRtl="true"
        android:theme="@style/Theme.CalorieTracker">

        <!-- Pre-loads on-device ML Kit models at install time -->
        <meta-data
            android:name="com.google.mlkit.vision.DEPENDENCIES"
            android:value="barcode,ocr" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.CalorieTracker">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/data/local/entity/FoodEntity.kt',
    language: 'kotlin',
    description: 'Room Entity for Foods with unique barcode index and basis',
    content: `package com.offlinetracker.calorie.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "foods",
    indices = [
        Index(value = ["barcode"], unique = true),
        Index(value = ["name"])
    ]
)
data class FoodEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val brand: String? = null,
    val barcode: String? = null, // Nullable, unique if present
    
    // Basis: "100G" or "SERVING"
    @ColumnInfo(defaultValue = "SERVING")
    val basis: String = "SERVING", 
    
    val servingSize: Double = 100.0,
    val servingUnit: String = "g", // "g", "ml", "piece", "bowl", "cup"
    
    // Core Macronutrients (per defined servingSize & basis)
    val calories: Double,
    val protein: Double,
    val carbohydrates: Double,
    val fat: Double,
    
    // Optional micronutrients & details
    val fiber: Double = 0.0,
    val sugars: Double = 0.0,
    val sodium: Double = 0.0, // in milligrams
    val saturatedFat: Double = 0.0,
    val transFat: Double = 0.0,
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/data/local/entity/DiaryEntryEntity.kt',
    language: 'kotlin',
    description: 'Room Entity for Daily Meals with foreign key cascade to FoodEntity',
    content: `package com.offlinetracker.calorie.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "diary_entries",
    foreignKeys = [
        ForeignKey(
            entity = FoodEntity::class,
            parentColumns = ["id"],
            childColumns = ["foodId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["foodId"]),
        Index(value = ["dateEpochDay"])
    ]
)
data class DiaryEntryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val foodId: Long,
    val mealType: String, // "BREAKFAST", "LUNCH", "DINNER", "SNACKS"
    val loggedAmount: Double, // Consumed quantity
    val loggedUnit: String, // "g", "ml", "serving"
    val calculatedCalories: Double,
    val calculatedProtein: Double,
    val calculatedCarbs: Double,
    val calculatedFat: Double,
    val dateEpochDay: Long, // LocalDate.toEpochDay()
    val timestamp: Long = System.currentTimeMillis()
)
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/domain/NutritionCalculator.kt',
    language: 'kotlin',
    description: 'Precision calculation domain logic with 1-decimal rounding',
    content: `package com.offlinetracker.calorie.domain

import com.offlinetracker.calorie.data.local.entity.FoodEntity
import java.math.BigDecimal
import java.math.RoundingMode

data class CalculatedNutrition(
    val calories: Double,
    val protein: Double,
    val carbohydrates: Double,
    val fat: Double,
    val fiber: Double = 0.0,
    val sugars: Double = 0.0,
    val sodium: Double = 0.0
)

object NutritionCalculator {

    fun calculate(food: FoodEntity, consumedAmount: Double): CalculatedNutrition {
        if (consumedAmount <= 0.0) {
            return CalculatedNutrition(0.0, 0.0, 0.0, 0.0)
        }

        val scaleFactor = when (food.basis.uppercase()) {
            "100G" -> consumedAmount / 100.0
            else -> {
                if (food.servingSize > 0.0) consumedAmount / food.servingSize else 1.0
            }
        }

        return CalculatedNutrition(
            calories = roundToOneDecimal(food.calories * scaleFactor),
            protein = roundToOneDecimal(food.protein * scaleFactor),
            carbohydrates = roundToOneDecimal(food.carbohydrates * scaleFactor),
            fat = roundToOneDecimal(food.fat * scaleFactor),
            fiber = roundToOneDecimal(food.fiber * scaleFactor),
            sugars = roundToOneDecimal(food.sugars * scaleFactor),
            sodium = roundToOneDecimal(food.sodium * scaleFactor)
        )
    }

    private fun roundToOneDecimal(value: Double): Double {
        return BigDecimal(value).setScale(1, RoundingMode.HALF_UP).toDouble()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/domain/ocr/NutritionLabelParser.kt',
    language: 'kotlin',
    description: 'On-device OCR label parser extracting calories, macros, sodium, and serving basis',
    content: `package com.offlinetracker.calorie.domain.ocr

data class ExtractedLabelData(
    val calories: Double? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null,
    val fiber: Double? = null,
    val sugars: Double? = null,
    val sodium: Double? = null,
    val servingSize: Double? = null,
    val servingUnit: String = "g",
    val isPer100g: Boolean = false,
    val rawText: String = ""
)

object NutritionLabelParser {

    fun parse(text: String): ExtractedLabelData {
        val lines = text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        val fullText = lines.joinToString(" ")

        val isPer100g = fullText.contains(Regex("""(?i)\\b(per\\s+100\\s*(g|ml)|100g|100ml)\\b"""))

        val calories = extractValue(lines, listOf(
            """(?i)\\b(?:energy|calories|cal|kcal)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)""",
            """(?i)(\\d+(?:\\.\\d+)?)\\s*(?:kcal|calories)\\b"""
        ))

        val protein = extractValue(lines, listOf(
            """(?i)\\b(?:protein|proteins)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*g?""",
            """(?i)\\b(\\d+(?:\\.\\d+)?)\\s*g?\\s*protein\\b"""
        ))

        val carbs = extractValue(lines, listOf(
            """(?i)\\b(?:total\\s*carbohydrate|carbohydrate|carbs|carb)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*g?""",
            """(?i)\\b(\\d+(?:\\.\\d+)?)\\s*g?\\s*(?:carbs|carbohydrates)\\b"""
        ))

        val fat = extractValue(lines, listOf(
            """(?i)\\b(?:total\\s*fat|fat|lipides)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*g?""",
            """(?i)\\b(\\d+(?:\\.\\d+)?)\\s*g?\\s*total\\s*fat\\b"""
        ))

        val fiber = extractValue(lines, listOf(
            """(?i)\\b(?:dietary\\s*fiber|fiber|fibre)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*g?"""
        ))

        val sugars = extractValue(lines, listOf(
            """(?i)\\b(?:total\\s*sugars|sugars|sugar)\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*g?"""
        ))

        val sodium = extractSodiumInMg(lines)
        val (servingSize, servingUnit) = extractServingSize(lines)

        return ExtractedLabelData(
            calories = calories,
            protein = protein,
            carbs = carbs,
            fat = fat,
            fiber = fiber,
            sugars = sugars,
            sodium = sodium,
            servingSize = servingSize,
            servingUnit = servingUnit,
            isPer100g = isPer100g,
            rawText = text
        )
    }

    private fun extractValue(lines: List<String>, patterns: List<String>): Double? {
        for (patternStr in patterns) {
            val regex = Regex(patternStr)
            for (line in lines) {
                val match = regex.find(line)
                if (match != null) {
                    val groupVal = match.groupValues[1]
                    val parsed = groupVal.toDoubleOrNull()
                    if (parsed != null) return parsed
                }
            }
        }
        return null
    }

    private fun extractSodiumInMg(lines: List<String>): Double? {
        val sodiumRegex = Regex("""(?i)\\bsodium\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*(mg|g)?""")
        for (line in lines) {
            val match = sodiumRegex.find(line)
            if (match != null) {
                val value = match.groupValues[1].toDoubleOrNull() ?: continue
                val unit = match.groupValues.getOrNull(2)?.lowercase() ?: "mg"
                return if (unit == "g") value * 1000.0 else value
            }
        }

        val saltRegex = Regex("""(?i)\\bsalt\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*(g|mg)?""")
        for (line in lines) {
            val match = saltRegex.find(line)
            if (match != null) {
                val value = match.groupValues[1].toDoubleOrNull() ?: continue
                val unit = match.groupValues.getOrNull(2)?.lowercase() ?: "g"
                return if (unit == "g") value * 400.0 else (value / 1000.0) * 400.0
            }
        }
        return null
    }

    private fun extractServingSize(lines: List<String>): Pair<Double?, String> {
        val servingRegex = Regex("""(?i)\\bserving\\s*size\\b[^\\d]*?(\\d+(?:\\.\\d+)?)\\s*(g|ml|oz|piece|scoop)?""")
        for (line in lines) {
            val match = servingRegex.find(line)
            if (match != null) {
                val size = match.groupValues[1].toDoubleOrNull()
                val unit = match.groupValues.getOrNull(2)?.lowercase()?.takeIf { it.isNotEmpty() } ?: "g"
                return Pair(size, unit)
            }
        }
        return Pair(null, "g")
    }
}
`,
  },
  {
    path: 'README.md',
    language: 'markdown',
    description: 'Full documentation and compilation guide for the Android project',
    content: `# Complete Offline-First Android Calorie Tracker

Built with Kotlin, Jetpack Compose (Material 3), Room DB, CameraX, and Google ML Kit.

## Key Features
- **100% Offline-First**: Zero internet permissions or external server dependencies.
- **Custom Barcodes**: Scan any physical barcode (EAN-13, EAN-8, UPC-A, UPC-E). If already saved, loads immediately; if unregistered, prompts instant creation. Manual barcode assignment & editing supported.
- **On-Device Label OCR**: Captures Nutrition Facts panel offline and extracts calories, protein, carbs, fat, fiber, sugars, sodium, and serving size.
- **Pre-populated Pakistani & International Foods**: Roti, Paratha, Biryani, Nihari, Daal, Pulao, Karahi, Doodh Patti Chai, plus everyday essentials.
- **Accurate Scaling**: Supports both 100g/ml basis and per-serving basis with decimal precision.
- **Daily Food Diary**: Breakfast, Lunch, Dinner, Snacks with copy yesterday's meals, edit, and delete.
- **Daily Targets & Dashboard**: Visual progress bars and macro tracking.
- **Storage Access Framework (SAF) JSON Backup**: Export and import complete snapshots.

## Building the Debug APK

\`\`\`bash
# Run unit tests
./gradlew test

# Build debug APK
./gradlew assembleDebug

# Output location:
# app/build/outputs/apk/debug/app-debug.apk

# Install via ADB:
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/data/entity/FitnessEntities.kt',
    language: 'kotlin',
    description: 'Room entities for Weight, Water, and Exercise entries',
    content: `package com.offlinetracker.calorie.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "weight_entries")
data class WeightEntryEntity(
    @PrimaryKey val id: String,
    val weightKg: Double,
    val date: String,
    val timestamp: Long,
    val bodyFatPercentage: Double? = null,
    val waistCm: Double? = null,
    val hipsCm: Double? = null,
    val chestCm: Double? = null,
    val notes: String? = null,
    val source: String = "MANUAL"
)

@Entity(tableName = "water_entries")
data class WaterEntryEntity(
    @PrimaryKey val id: String,
    val amountMl: Int,
    val date: String,
    val timestamp: Long
)

@Entity(tableName = "exercise_entries")
data class ExerciseEntryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val durationMinutes: Int,
    val distanceKm: Double? = null,
    val intensity: String,
    val estimatedCalories: Int,
    val sets: Int? = null,
    val reps: Int? = null,
    val weightLiftedKg: Double? = null,
    val date: String,
    val timestamp: Long,
    val source: String = "MANUAL"
)
`,
  },
  {
    path: 'app/src/main/java/com/offlinetracker/calorie/domain/fitness/FitnessCalculator.kt',
    language: 'kotlin',
    description: 'Domain calculations for BMI, MET calories, and Health Connect deduplication',
    content: `package com.offlinetracker.calorie.domain.fitness

import java.math.BigDecimal
import java.math.RoundingMode

data class BmiResult(
    val bmi: Double,
    val category: String,
    val colorHex: String
)

object FitnessCalculator {

    fun calculateBmi(weightKg: Double, heightCm: Double): BmiResult? {
        if (weightKg <= 0 || heightCm <= 0) return null
        val heightM = heightCm / 100.0
        val raw = weightKg / (heightM * heightM)
        val bmi = BigDecimal(raw).setScale(1, RoundingMode.HALF_UP).toDouble()

        val (cat, color) = when {
            bmi < 18.5 -> "Underweight" to "#3B82F6"
            bmi <= 24.9 -> "Normal" to "#10B981"
            bmi <= 29.9 -> "Overweight" to "#F59E0B"
            else -> "Obese" to "#EF4444"
        }
        return BmiResult(bmi, cat, color)
    }

    fun calculateExerciseCalories(
        category: String,
        intensity: String,
        durationMinutes: Int,
        userWeightKg: Double
    ): Int {
        if (durationMinutes <= 0 || userWeightKg <= 0.0) return 0
        val met = when (category.lowercase()) {
            "running" -> if (intensity == "vigorous") 11.5 else if (intensity == "light") 6.0 else 8.3
            "cycling" -> if (intensity == "vigorous") 10.0 else if (intensity == "light") 4.0 else 6.8
            "swimming" -> if (intensity == "vigorous") 9.8 else if (intensity == "light") 5.0 else 7.0
            "strength" -> if (intensity == "vigorous") 6.0 else if (intensity == "light") 3.0 else 4.5
            "walking" -> if (intensity == "vigorous") 4.5 else if (intensity == "light") 2.8 else 3.5
            else -> 5.0
        }
        return (met * userWeightKg * (durationMinutes / 60.0)).toInt()
    }
}
`,
  },
];
