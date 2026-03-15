// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "InkFlow",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "InkFlowKit", targets: ["InkFlowKit"]),
    ],
    dependencies: [
        .package(url: "https://github.com/swiftlang/swift-testing.git", from: "0.12.0"),
    ],
    targets: [
        .target(
            name: "InkFlowKit",
            path: "Sources/InkFlowKit"
        ),
        .testTarget(
            name: "InkFlowKitTests",
            dependencies: [
                "InkFlowKit",
                .product(name: "Testing", package: "swift-testing"),
            ],
            path: "Tests/InkFlowKitTests"
        ),
    ]
)
