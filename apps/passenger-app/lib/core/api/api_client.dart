import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  late Dio dio;
  final storage = const FlutterSecureStorage();
  
  String get baseUrl =>
      dotenv.env['API_BASE_URL'] ?? "http://187.124.34.118/api/v1";

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add Auth Interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Attempt token refresh once if refresh_token is available
            final refreshToken = await storage.read(key: 'refresh_token');
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                final refreshResponse = await Dio(BaseOptions(baseUrl: baseUrl)).post(
                  '/auth/refresh',
                  data: {'refreshToken': refreshToken},
                );
                final newToken = refreshResponse.data['accessToken'] ?? refreshResponse.data['token'];
                if (newToken != null) {
                  await storage.write(key: 'jwt_token', value: newToken);
                  e.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                  final cloneReq = await dio.fetch(e.requestOptions);
                  return handler.resolve(cloneReq);
                }
              } catch (_) {
                await storage.delete(key: 'jwt_token');
                await storage.delete(key: 'refresh_token');
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
